using BookStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BookStore.Infrastructure.Persistence.Configurations;

namespace BookStore.Infrastructure.Persistence;

public class BookStoreDbContext : DbContext
{
    public BookStoreDbContext(DbContextOptions<BookStoreDbContext> options)
        : base(options)
    {
    }

    // DbSets map to your tables
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Genre> Genres => Set<Genre>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply EF Core configuration classes
        modelBuilder.ApplyConfiguration(new BookConfiguration());
        modelBuilder.ApplyConfiguration(new GenreConfiguration());
    }
}
