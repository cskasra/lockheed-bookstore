namespace BookStore.Domain.Entities;

public class Genre
{
    public int GenreId { get; set; }                // INTEGER PRIMARY KEY AUTOINCREMENT
    public string Name { get; set; } = default!;    // UNIQUE NOT NULL

    public ICollection<Book> Books { get; set; } = new List<Book>();
}
