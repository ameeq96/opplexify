import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CmsService, type UploadedMediaFile } from "./cms.service";

type AuthedRequest = { user: { id: string; role: string } };
type MulterCallback = (error: Error | null, value: string) => void;
type MulterFileInfo = { fieldname: string; originalname: string };

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "EDITOR")
@Controller("admin")
export class AdminController {
  constructor(private readonly cms: CmsService) {}

  @Get("dashboard")
  dashboard() {
    return this.cms.dashboard();
  }

  @Post("media/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req: unknown, _file: unknown, cb: MulterCallback) => {
          const destination = join(process.cwd(), "uploads");
          mkdirSync(destination, { recursive: true });
          cb(null, destination);
        },
        filename: (_req: unknown, file: MulterFileInfo, cb: MulterCallback) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${suffix}${extname(file.originalname)}`);
        }
      })
    })
  )
  uploadMedia(
    @UploadedFile() file: UploadedMediaFile,
    @Body() body: Record<string, string>,
    @Req() req: AuthedRequest
  ) {
    return this.cms.createMedia(file, body, req.user.id);
  }

  @Get(":resource")
  list(
    @Param("resource") resource: string,
    @Query() query: Record<string, string | undefined>,
    @Req() req: AuthedRequest
  ) {
    this.assertResourceAccess(resource, req.user.role);
    return this.cms.list(resource, query);
  }

  @Get(":resource/:id")
  find(@Param("resource") resource: string, @Param("id") id: string, @Req() req: AuthedRequest) {
    this.assertResourceAccess(resource, req.user.role);
    return this.cms.find(resource, id);
  }

  @Post(":resource")
  create(@Param("resource") resource: string, @Body() body: Record<string, unknown>, @Req() req: AuthedRequest) {
    this.assertResourceAccess(resource, req.user.role);
    return this.cms.create(resource, body, req.user.id);
  }

  @Patch(":resource/:id")
  update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthedRequest
  ) {
    this.assertResourceAccess(resource, req.user.role);
    return this.cms.update(resource, id, body, req.user.id);
  }

  @Delete(":resource/:id")
  remove(@Param("resource") resource: string, @Param("id") id: string, @Req() req: AuthedRequest) {
    this.assertResourceAccess(resource, req.user.role);
    return this.cms.remove(resource, id);
  }

  private assertResourceAccess(resource: string, role: string) {
    if (role === "SUPER_ADMIN") return;
    if (resource === "users") {
      throw new ForbiddenException("Only super admins can manage users.");
    }
    if (role === "EDITOR" && ["settings", "menus", "menu-items"].includes(resource)) {
      throw new ForbiddenException("Editors cannot manage global settings or menus.");
    }
  }
}
