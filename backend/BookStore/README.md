High-level plan
Area	Choice / Approach
.NET version	ASP.NET Core Web API (.NET 8+; treat as “.NET 10”)
Architecture	Clean Architecture + Vertical Slice
Data access	EF Core + SQLite (simple for local dev)
CQRS & mediator	MediatR (or hand-rolled)
Logging	Serilog + request/correlation ID
External dependency	Open Library via IOpenLibraryClient abstraction




To build the API:

dotnet restore
dotnet build


To run EF migration:
dotnet ef migrations add InitialCreate \
  --project ../BookStore.Infrastructure \
  --startup-project .


To run the API:

dotnet run --project BookStore.Api


In VS Code, use the C# extension for debugging; set BookStore.Api as the startup project.

Test endpoints (e.g. via curl or Thunder Client):

Search Open Library:
curl "https://localhost:5001/api/books/search?title=the%20hobbit"

Persist a book (using one of the returned items):
curl -X POST "https://localhost:5001/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "9780261102217",
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "publishYear": 1937
  }'

Get all books:
curl "https://localhost:5001/api/books"
