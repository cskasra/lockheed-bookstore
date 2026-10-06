using BookStore.Application.Features.Books.CreateBook;
using BookStore.Application.Interfaces;
using BookStore.Infrastructure.External;
using BookStore.Infrastructure.Persistence;
using BookStore.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// CORS: allow your frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin() // or .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// -----------------------------------------------------
// Serilog Logging
// -----------------------------------------------------
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()

    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// -----------------------------------------------------
// Services
// -----------------------------------------------------
builder.Services.AddHttpContextAccessor();

// EF Core DbContext -- add DbContext using connection string from appsettings.json
builder.Services.AddDbContext<BookStoreDbContext>(options =>
    options.UseSqlite("Data Source=../data/bookstore.db"));

// Repositories
builder.Services.AddScoped<IBookRepository, BookRepository>();

// External OpenLibrary client
builder.Services.AddHttpClient<OpenLibraryClient>();
builder.Services.AddScoped<IBookCatalogClient, OpenLibraryClient>();

// MediatR v14 registration
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(CreateBookCommand).Assembly);
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -----------------------------------------------------
// Correlation ID Middleware
// -----------------------------------------------------
app.Use(async (context, next) =>
{
    var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault()
                        ?? Guid.NewGuid().ToString();

    context.Items["CorrelationId"] = correlationId;

    using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
    {
        await next();
    }
});

// -----------------------------------------------------
// Swagger UI
// -----------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Lockheed Martin BookStore API v1");
        options.DocumentTitle = "Lockheed Martin BookStore API Documentation";
    });
    app.MapGet("/", context =>
    {
        context.Response.Redirect("/swagger");
        return Task.CompletedTask;
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // Apply CORS
app.MapControllers();
app.Run();
