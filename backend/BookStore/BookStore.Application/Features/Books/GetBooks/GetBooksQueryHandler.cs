using BookStore.Application.Common;
using BookStore.Application.Interfaces;
using BookStore.Domain.Entities;
using MediatR;

namespace BookStore.Application.Features.Books.GetBooks;

public class GetBooksQueryHandler
    : IRequestHandler<GetBooksQuery, Result<BookListResponse>>
{
    private readonly IBookRepository _repo;

    public GetBooksQueryHandler(IBookRepository repo) => _repo = repo;

    public async Task<Result<BookListResponse>> Handle(
        GetBooksQuery request,
        CancellationToken ct)
    {
        var books = (await _repo.GetAllAsync(ct)).ToList();

        // total BEFORE paging
        int totalRecords = books.Count;

        // SORTING
        if (!string.IsNullOrWhiteSpace(request._sort))
        {
            books = request._sort.ToLower() switch
            {
                "title"  => books.OrderBy(b => b.Title).ToList(),
                "author" => books.OrderBy(b => b.Author).ToList(),
                "price"  => books.OrderBy(b => b.Price).ToList(),
                "year"   => books.OrderBy(b => b.PublishedYear).ToList(),
                _        => books
            };
        }

        const int pageSize = 6;

        if (request._page is not null && request._page > 0)
        {
            books = books
                .Skip((request._page.Value - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        var response = new BookListResponse(
            Data: books,
            Count: totalRecords
        );

        return Result<BookListResponse>.Ok(response);
    }
}
