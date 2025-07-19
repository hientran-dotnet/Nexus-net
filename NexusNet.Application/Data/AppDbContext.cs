using Microsoft.EntityFrameworkCore;
using NexusNet.Application.Models.Entities;

namespace NexusNet.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Account> UserAccounts { get; set; }
    }
}