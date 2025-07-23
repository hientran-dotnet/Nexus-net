using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace NexusNet.Repositories.Entities;

public partial class NexusNetAdminSourceDbContext : DbContext
{
    public NexusNetAdminSourceDbContext()
    {
    }

    public NexusNetAdminSourceDbContext(DbContextOptions<NexusNetAdminSourceDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=HienTran\\HIENTM0978SQLSV;Initial Catalog=NexusNet_AdminSource_Db;Integrated Security=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CC4C37DE4");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105347C42DA6D").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DisplayName).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.HashedPassword).HasMaxLength(512);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("User");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
