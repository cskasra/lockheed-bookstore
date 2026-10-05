using BookStore.Application.Common;
using BookStore.Application.Features.Books.CreateBook;
using BookStore.Application.Features.Books.GetBooks;
using BookStore.Application.Features.Books.UpdateBook;
using BookStore.Application.Features.Books.DeleteBook;
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
    [HttpPost]
    public async Task<IActionResult> AddBook([FromBody] CreateBookCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        if (!result.Success) return Problem(result.Error);

        return CreatedAtAction(nameof(GetBooks), new { id = result.Value }, null);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("Route id and body id must match.");

        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok() : Problem(result.Error);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteBookCommand(id), ct);
        return result.Success ? Ok() : Problem(result.Error);
    }
}
