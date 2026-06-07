export type BaseEntity = Readonly<{
  createdAt: Date;
  deletedAt?: Date | null;
  id: string;
  updatedAt: Date;
}>;

export type AuditableEntity = BaseEntity &
  Readonly<{
    createdBy: string;
    updatedBy: string;
  }>;

export type PaginationParams = Readonly<{
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}>;

export type PaginationMeta = Readonly<{
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>;

export type PaginatedList<TItem> = Readonly<{
  items: readonly TItem[];
  page: number;
  pageSize: number;
  total: number;
}>;
