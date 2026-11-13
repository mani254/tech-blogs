// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Options accepted by any paginated query method.
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Generic paginated result wrapper.
 *
 * Used by repositories (e.g. PaginatedResult<UserEntity>)
 * and by API response types (e.g. PaginatedResult<UserSummary>).
 *
 * @example
 * async findUsers(query: string): Promise<PaginatedResult<UserEntity>>
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
