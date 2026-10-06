using System.Net.Http.Json;
using System.Text.Json;
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
        string titleAuthorIsbn,
        CancellationToken ct)
    {
        try
        {
            // 1. Properly construct and encode the Solr query
            var query = $"title:\"{titleAuthorIsbn}\" OR author:\"{titleAuthorIsbn}\" OR isbn:\"{titleAuthorIsbn}\"";
            var url = $"https://openlibrary.org/search.json?q={Uri.EscapeDataString(query)}&fields=title,author_name,isbn,first_publish_year,cover_i,key";
            
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenLibrary returned {StatusCode} for title {Title}", response.StatusCode, titleAuthorIsbn);
                return Array.Empty<CatalogBookDto>();
            }

            var payload = await response.Content.ReadFromJsonAsync<OpenLibrarySearchResponse>(cancellationToken: ct);
            if (payload?.Docs == null || payload.Docs.Count == 0) return Array.Empty<CatalogBookDto>();

            // 2. Project tasks for concurrent execution to resolve the `await` in LINQ error
            var bookTasks = payload.Docs
                .Take(10)
                .Select(async d =>
                {
                    var isbn = d.Isbn?.FirstOrDefault() ?? string.Empty;
                    var author = d.Author_name?.FirstOrDefault() ?? "Unknown";
                    var coverUrl = d.Cover_i is null
                        ? null
                        : $"https://covers.openlibrary.org/b/id/{d.Cover_i}-L.jpg";
                    var key = d.Key ?? string.Empty;
                    var description = "Description not available.";

                    // 3. Fetch the description using JsonDocument to avoid missing DTO classes
                    if (!string.IsNullOrEmpty(d.Key))
                    {
                        var workUrl = $"https://openlibrary.org{d.Key}.json";
                        var workResponse = await _httpClient.GetAsync(workUrl, ct);

                        if (workResponse.IsSuccessStatusCode)
                        {
                            var workJson = await workResponse.Content.ReadAsStringAsync(ct);
                            using var workDoc = JsonDocument.Parse(workJson);

                            if (workDoc.RootElement.TryGetProperty("description", out var descElement))
                            {
                                if (descElement.ValueKind == JsonValueKind.String)
                                {
                                    description = descElement.GetString() ?? description;
                                }
                                else if (descElement.ValueKind == JsonValueKind.Object && descElement.TryGetProperty("value", out var valueProp))
                                {
                                    description = valueProp.GetString() ?? description;
                                }
                            }
                        }
                    }

                    // 4. Fixed positional constructor syntax
                    return new CatalogBookDto(
                        Title: d.Title ?? string.Empty,
                        Author: author,
                        Isbn: isbn,
                        PublishedYear: d.First_publish_year,
                        CoverUrl: coverUrl,
                        OpenLibraryKey: key,
                        Description: description 
                    );
                });

            // 5. Await all secondary HTTP requests
            var books = await Task.WhenAll(bookTasks);

            return books
                .Where(b => !string.IsNullOrWhiteSpace(b.Title))
                .ToList();
        }
        catch (TaskCanceledException)
        {
            _logger.LogWarning("OpenLibrary search timed out for title {Title}", titleAuthorIsbn);
            return Array.Empty<CatalogBookDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenLibrary search failed for title {Title}", titleAuthorIsbn);
            return Array.Empty<CatalogBookDto>();
        }
    }
}