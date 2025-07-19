using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NexusNet.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            // Kết nối giống appsettings.json
            optionsBuilder.UseSqlServer("data source=HienTran\\HIENTM0978SQLSV;initial catalog=NexusNet;user id=sa;password=Hien@Tran228805;MultipleActiveResultSets=true;TrustServerCertificate=True");
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}