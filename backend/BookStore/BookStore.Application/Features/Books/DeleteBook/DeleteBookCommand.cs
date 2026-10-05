using MediatR;
using BookStore.Application.Common;

namespace BookStore.Application.Features.Books.DeleteBook;

public record DeleteBookCommand(int Id) : IRequest<Result<bool>>;
