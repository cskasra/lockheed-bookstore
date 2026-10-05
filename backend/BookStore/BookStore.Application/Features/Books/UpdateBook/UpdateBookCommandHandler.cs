using MediatR;
using BookStore.Application.Common;
using BookStore.Application.Interfaces;

namespace BookStore.Application.Features.Books.UpdateBook;

public class UpdateBookCommandHandler : IRequestHandler<UpdateBookCommand, Result<bool>>
{
    private readonly IBookRepository _repo;

    public UpdateBookCommandHandler(IBookRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<bool>> Handle(UpdateBookCommand request, CancellationToken ct)
    {
        var book = await _repo.GetByIdAsync(request.Id, ct);
        if (book is null)
            return Result<bool>.Ok(false);

        book.Title = request.Title;
        book.Author = request.Author;
        book.Isbn = request.Isbn;
        book.PublishedYear = request.PublishedYear;
        book.CoverUrl = request.CoverUrl;
        book.OpenLibraryKey = request.OpenLibraryKey;
        book.Description = request.Description;
        book.GenreId = request.GenreId;
        book.Price = request.Price;
        book.Stock = request.Stock;

        await _repo.SaveChangesAsync(ct);

        return Result<bool>.Ok(true);
    }
}
