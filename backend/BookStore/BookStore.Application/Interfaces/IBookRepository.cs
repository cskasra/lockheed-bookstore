using BookStore.Domain.Entities;

namespace BookStore.Application.Interfaces;

public interface IBookRepository
{
    Task<Book?> GetByIdAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<Book>> GetAllAsync(CancellationToken ct);
    Task AddAsync(Book book, CancellationToken ct);
    Task DeleteAsync(Book book, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
    Task<Book?> GetByIsbnAsync(string isbn, CancellationToken ct);
}
