using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data
{
    public class ToDoDbContext : IdentityDbContext<User>
    {
        public ToDoDbContext(DbContextOptions<ToDoDbContext> options) : base(options)
        {
        }

        public DbSet<Todo> Todos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // הגדרת קשר בין Todo למשתמש
            modelBuilder.Entity<Todo>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // הגדרות נוספות
            modelBuilder.Entity<Todo>()
                .Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Todo>()
                .Property(t => t.Description)
                .HasMaxLength(1000);

            modelBuilder.Entity<Todo>()
                .Property(t => t.IsCompleted)
                .HasDefaultValue(false);
        }
    }
}