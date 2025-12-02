using Microsoft.AspNetCore.Identity;

namespace TodoApi.Models
{
    public class User : IdentityUser
    {
        public string? DisplayName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}