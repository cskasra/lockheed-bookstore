using MediatR;
using BookStore.Application.Common;
using BookStore.Application.Interfaces;

namespace BookStore.Application.Features.Books.DeleteBook;

public class DeleteBookCommandHandler : IRequestHandler<DeleteBookCommand, Result<bool>>
{
    private readonly IBookRepository _repo;

    public DeleteBookCommandHandler(IBookRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<bool>> Handle(DeleteBookCommand request, CancellationToken ct)
    {
        var book = await _repo.GetByIdAsync(request.Id, ct);
        if (book is null)
            return Result<bool>.Ok(false);

        await _repo.DeleteAsync(book, ct);
        await _repo.SaveChangesAsync(ct);

        return Result<bool>.Ok(true);
    }
}
