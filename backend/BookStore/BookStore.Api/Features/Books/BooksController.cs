using BookStore.Application.Common;
using BookStore.Application.Features.Books.CreateBook;
using BookStore.Application.Features.Books.GetBooks;
using BookStore.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Api.Features.Books;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IBookCatalogClient _catalogClient;

    public BooksController(IMediator mediator, IBookCatalogClient catalogClient)
    {
        _mediator = mediator;
        _catalogClient = catalogClient;
    }

    // GET api/books
    [HttpGet]
    public async Task<IActionResult> GetBooks(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBooksQuery(), ct);
        return result.Success ? Ok(result.Value) : Problem(result.Error);
    }

    // GET api/books/search?title=...
    [HttpGet("search")]
    public async Task<IActionResult> SearchBooks([FromQuery] string title, CancellationToken ct)
    {
        var books = await _catalogClient.SearchByTitleAsync(title, ct);
        return Ok(books);
    }

    // POST api/books
    // Client posts selected Open Library result + local fields (GenreId, Price, Stock)
    [HttpPost]
    public async Task<IActionResult> AddBook([FromBody] CreateBookCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        if (!result.Success) return Problem(result.Error);

        return CreatedAtAction(nameof(GetBooks), new { id = result.Value }, null);
    }
}
