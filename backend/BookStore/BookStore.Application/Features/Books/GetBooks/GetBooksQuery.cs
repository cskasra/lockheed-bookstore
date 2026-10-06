using MediatR;
using BookStore.Application.Common;

namespace BookStore.Application.Features.Books.GetBooks;

public record GetBooksQuery(
    int? _page = null,
    string? _sort = null
) : IRequest<Result<BookListResponse>>;
