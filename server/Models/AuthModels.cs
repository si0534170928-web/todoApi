using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(50)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string DisplayName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Expires { get; set; }
    }
}