using MediatR;
using BookStore.Application.Common;
using BookStore.Domain.Entities;

namespace BookStore.Application.Features.Books.GetBooks;

public record GetBooksQuery() : IRequest<Result<IReadOnlyList<Book>>>;
