namespace BookStore.Domain.Entities;

public class Book
{
    public int Id { get; set; }                     // INTEGER PRIMARY KEY AUTOINCREMENT

    public string Title { get; set; } = default!;   // NOT NULL
    public string Author { get; set; } = default!;  // NOT NULL
    public string Isbn { get; set; } = default!;    // NOT NULL

    public int? PublishedYear { get; set; }         // INTEGER (nullable)
    public string? CoverUrl { get; set; }           // TEXT (nullable)

    public string OpenLibraryKey { get; set; } = default!; // NOT NULL
    public string? Description { get; set; }        // TEXT (nullable)

    public int GenreId { get; set; }                // FK NOT NULL
    public decimal Price { get; set; }              // DECIMAL(10,2) NOT NULL
    public int? Stock { get; set; }                 // INTEGER (nullable)

    // Navigation property
    public Genre Genre { get; set; } = default!;
}
