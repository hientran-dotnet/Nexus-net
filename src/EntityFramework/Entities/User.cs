using System;
using System.Collections.Generic;

namespace EntityFramework.Entities;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string HashedPassword { get; set; } = null!;

    public string PasswordSalt { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? FullName { get; set; }

    public DateTime CreateAt { get; set; }

    public DateTime? LastLogin { get; set; }

    public string IsActive { get; set; } = null!;

    public string? Role { get; set; }
}
