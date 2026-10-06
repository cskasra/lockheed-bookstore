using BookStore.Domain.Entities;

namespace BookStore.Application.Features.Books.GetBooks;

public record BookListResponse(
    IReadOnlyList<Book> Data,
    int Count
);
