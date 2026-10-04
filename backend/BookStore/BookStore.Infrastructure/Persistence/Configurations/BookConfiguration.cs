using BookStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Persistence.Configurations;

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Inventory");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Title).IsRequired();
        builder.Property(b => b.Author).IsRequired();
        builder.Property(b => b.Isbn).IsRequired();
        builder.Property(b => b.OpenLibraryKey).IsRequired();

        builder.Property(b => b.Price)
               .HasColumnType("DECIMAL(10,2)");

        builder.HasOne(b => b.Genre)
               .WithMany(g => g.Books)
               .HasForeignKey(b => b.GenreId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
