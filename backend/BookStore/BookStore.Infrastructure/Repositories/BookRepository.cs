using BookStore.Application.Interfaces;
using BookStore.Domain.Entities;
using BookStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories;

public class BookRepository : IBookRepository
{
    private readonly BookStoreDbContext _db;

    public BookRepository(BookStoreDbContext db) => _db = db;

    public Task<Book?> GetByIdAsync(int id, CancellationToken ct) =>
        _db.Books.Include(b => b.Genre)
                 .FirstOrDefaultAsync(b => b.Id == id, ct);

    public async Task<IReadOnlyList<Book>> GetAllAsync(CancellationToken ct) =>
        await _db.Books
                 .Include(b => b.Genre)
                 .AsNoTracking()
                 .ToListAsync(ct);

    public async Task AddAsync(Book book, CancellationToken ct) =>
        await _db.Books.AddAsync(book, ct);

    public Task DeleteAsync(Book book, CancellationToken ct)
    {
        _db.Books.Remove(book);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) =>
        _db.SaveChangesAsync(ct);

    public async Task<Book?> GetByIsbnAsync(string isbn, CancellationToken ct)
    {
        return await _db.Books
            .FirstOrDefaultAsync(b => b.Isbn == isbn, ct);
    }
}
