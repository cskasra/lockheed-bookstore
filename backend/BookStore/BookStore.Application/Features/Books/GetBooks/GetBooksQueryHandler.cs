using BookStore.Application.Common;
using BookStore.Application.Interfaces;
using BookStore.Domain.Entities;
using MediatR;

namespace BookStore.Application.Features.Books.GetBooks;

public class GetBooksQueryHandler
    : IRequestHandler<GetBooksQuery, Result<IReadOnlyList<Book>>>
{
    private readonly IBookRepository _repo;

    public GetBooksQueryHandler(IBookRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<Book>>> Handle(
        GetBooksQuery request,
        CancellationToken ct)
    {
        var books = await _repo.GetAllAsync(ct);
        return Result<IReadOnlyList<Book>>.Ok(books);
    }
}
