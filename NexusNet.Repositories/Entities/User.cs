using System;
using System.Collections.Generic;

namespace NexusNet.Repositories.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? Username { get; set; }

    public string HashedPassword { get; set; } = null!;

    public string? Role { get; set; }

    public string? DisplayName { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsActive { get; set; }
}
