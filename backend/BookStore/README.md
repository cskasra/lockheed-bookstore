# Lockheed Bookstore Test Project 
## Cyrus Kasra -- info@cyruskasra.com -- 20261004 -- https://github.com/cskasra/lockheed-bookstore/tree/main
 
## High-level Plan

| Area                | Choice/Approach                                    |
| ------------------- | -------------------------------------------------- |
| .NET version        | ASP.NET Core Web API (.NET 8+; treat as “.NET 10”) |
| Architecture        | Clean Architecture + Vertical Slice                |
| Data access         | EF Core + SQLite (simple for local dev)            |
| CQRS & mediator     | MediatR (or hand-rolled)                           |
| Logging             | Serilog + request/correlation ID                   |
| External dependency | Open Library via IOpenLibraryClient abstraction    |


## To build and run the API from project root directory:

dotnet restore
dotnet build
dotnet run --project BookStore.Api


## Swagger

https://localhost:7478/swagger/index.html



## To run EF migration:
dotnet ef migrations add InitialCreate \
  --project ../BookStore.Infrastructure \
  --startup-project .


## Debugging
In VS Code, use the C# extension for debugging; set BookStore.Api as the startup project.


## Test endpoints (e.g. via curl or Thunder Client):

### Search Open Library:
curl "https://localhost:7478/api/books/search?title=the%20hobbit"

### Persist a book (using one of the returned items):
curl -X POST "https://localhost:7478/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "9780261102217",
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "publishYear": 1937
  }'

### Get all books:
curl "https://localhost:7478/api/books"
