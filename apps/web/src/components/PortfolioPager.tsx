"use client";

import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { portfolioProjects } from "@/lib/data";

const projectsPerPage = 12;

export function PortfolioPager() {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(portfolioProjects.length / projectsPerPage);
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const safePage = Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1;
  const currentPage = Math.min(Math.max(safePage, 1), totalPages);
  const start = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = portfolioProjects.slice(start, start + projectsPerPage);

  return (
    <>
      <PortfolioGrid projects={paginatedProjects} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
