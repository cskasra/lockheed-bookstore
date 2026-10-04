namespace BookStore.Application.Interfaces;

public record CatalogBookDto(
    string Title,
    string Author,
    string Isbn,
    int? PublishedYear,
    string? CoverUrl,
    string OpenLibraryKey,
    string? Description
);

public interface IBookCatalogClient
{
    Task<IReadOnlyList<CatalogBookDto>> SearchByTitleAsync(
        string title,
        CancellationToken ct);
}
