using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class Todo
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        public bool IsCompleted { get; set; } = false;
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        
        public DateTime? CompletedDate { get; set; }
        
        // User relationship
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public User? User { get; set; }
    }
}