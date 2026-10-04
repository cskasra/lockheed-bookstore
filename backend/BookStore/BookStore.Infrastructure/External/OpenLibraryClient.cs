using System.Net.Http.Json;
using BookStore.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace BookStore.Infrastructure.External;

public class OpenLibraryClient : IBookCatalogClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenLibraryClient> _logger;

    public OpenLibraryClient(HttpClient httpClient, ILogger<OpenLibraryClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    private sealed class OpenLibrarySearchResponse
    {
        public List<Doc> Docs { get; set; } = new();

        public sealed class Doc
        {
            public string? Title { get; set; }
            public List<string>? Author_name { get; set; }
            public List<string>? Isbn { get; set; }
            public int? First_publish_year { get; set; }
            public string? Key { get; set; }
            public int? Cover_i { get; set; }
        }
    }

    public async Task<IReadOnlyList<CatalogBookDto>> SearchByTitleAsync(
        string title,
        CancellationToken ct)
    {
        try
        {
            var url = $"https://openlibrary.org/search.json?title={Uri.EscapeDataString(title)}";
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenLibrary returned {StatusCode} for title {Title}",
                    response.StatusCode, title);
                return Array.Empty<CatalogBookDto>();
            }

            var payload = await response.Content.ReadFromJsonAsync<OpenLibrarySearchResponse>(cancellationToken: ct);
            if (payload is null) return Array.Empty<CatalogBookDto>();

            return payload.Docs
                .Take(10)
                .Select(d =>
                {
                    var isbn = d.Isbn?.FirstOrDefault() ?? string.Empty;
                    var author = d.Author_name?.FirstOrDefault() ?? "Unknown";
                    var coverUrl = d.Cover_i is null
                        ? null
                        : $"https://covers.openlibrary.org/b/id/{d.Cover_i}-L.jpg";

                    var key = d.Key ?? string.Empty;

                    return new CatalogBookDto(
                        Title: d.Title ?? string.Empty,
                        Author: author,
                        Isbn: isbn,
                        PublishedYear: d.First_publish_year,
                        CoverUrl: coverUrl,
                        OpenLibraryKey: key,
                        Description: null
                    );
                })
                .Where(b => !string.IsNullOrWhiteSpace(b.Title))
                .ToList();
        }
        catch (TaskCanceledException)
        {
            _logger.LogWarning("OpenLibrary search timed out for title {Title}", title);
            return Array.Empty<CatalogBookDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenLibrary search failed for title {Title}", title);
            return Array.Empty<CatalogBookDto>();
        }
    }
}
