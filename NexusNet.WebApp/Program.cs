using Microsoft.EntityFrameworkCore;
using NexusNet.Repositories.Entities;
using NexusNet.Repositories.Interface.Users;
using NexusNet.Repositories.Repository.Users;
using NexusNet.Services.Interface.Users;
using NexusNet.Services.Service.Users;
using NexusNet.WebApp.Components;

namespace NexusNet.WebApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents();

            // Add services for db connection
            builder.Services.AddDbContext<NexusNetAdminSourceDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add services for authentication and authorization
            builder.Services.AddAuthentication("NexusNetAuth")
                .AddCookie(options =>
                {
                    options.LoginPath = "/Login";
                    options.LogoutPath = "/Logout";
                    options.AccessDeniedPath = "/AccessDenied";
                    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
                    options.SlidingExpiration = true;
                    options.Cookie.Name = "NexusNetAuthCookie";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                });


            // Add services for dependency injection
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IAuthenticationUserService, AuthenticationUserService>();
            builder.Services.AddScoped<IUserPasswordService, UserPasswordService>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            builder.Services.AddAuthorization();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseStaticFiles();
            app.UseAntiforgery();

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            app.Run();
        }
    }
}
