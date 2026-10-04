using BookStore.Application.Common;
using BookStore.Application.Interfaces;
using BookStore.Domain.Entities;
using MediatR;

namespace BookStore.Application.Features.Books.CreateBook;

public class CreateBookCommandHandler
    : IRequestHandler<CreateBookCommand, Result<int>>
{
    private readonly IBookRepository _repo;

    public CreateBookCommandHandler(IBookRepository repo) => _repo = repo;

    public async Task<Result<int>> Handle(
        CreateBookCommand request,
        CancellationToken ct)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            Isbn = request.Isbn,
            PublishedYear = request.PublishedYear,
            CoverUrl = request.CoverUrl,
            OpenLibraryKey = request.OpenLibraryKey,
            Description = request.Description,
            GenreId = request.GenreId,
            Price = request.Price,
            Stock = request.Stock
        };

        await _repo.AddAsync(book, ct);
        await _repo.SaveChangesAsync(ct);

        return Result<int>.Ok(book.Id);
    }
}
