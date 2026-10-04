using BookStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Persistence.Configurations;

public class GenreConfiguration : IEntityTypeConfiguration<Genre>
{
    public void Configure(EntityTypeBuilder<Genre> builder)
    {
        builder.ToTable("Genre");

        builder.HasKey(g => g.GenreId);

        builder.Property(g => g.Name)
               .IsRequired()
               .HasMaxLength(100);

        builder.HasIndex(g => g.Name).IsUnique();
    }
}
