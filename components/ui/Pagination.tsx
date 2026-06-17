type PaginationProps = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: PaginationProps) {
  return <p className="text-sm text-slate-400">Pagina {page} de {totalPages}</p>;
}