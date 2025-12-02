using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodosController : ControllerBase
    {
        private readonly ToDoDbContext _context;

        public TodosController(ToDoDbContext context)
        {
            _context = context;
        }

        // GET: api/todos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetTodos()
        {
            return await _context.Todos.ToListAsync();
        }

        // GET: api/todos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Todo>> GetTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);

            if (todo == null)
            {
                return NotFound();
            }

            return todo;
        }

        // GET: api/todos/month/{year}/{month}
        [HttpGet("month/{year}/{month}")]
        public async Task<ActionResult<IEnumerable<Todo>>> GetTodosByMonth(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var todos = await _context.Todos
                .Where(t => t.CreatedDate >= startDate && t.CreatedDate < endDate)
                .ToListAsync();

            return todos;
        }

        // GET: api/todos/date/{date}
        [HttpGet("date/{date}")]
        public async Task<ActionResult<IEnumerable<Todo>>> GetTodosByDate(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            var todos = await _context.Todos
                .Where(t => t.CreatedDate >= startDate && t.CreatedDate < endDate)
                .ToListAsync();

            return todos;
        }

        // POST: api/todos
        [HttpPost]
        public async Task<ActionResult<Todo>> PostTodo(Todo todo)
        {
            // Set default user ID if not provided (for now)
            if (string.IsNullOrEmpty(todo.UserId))
            {
                todo.UserId = "default-user";
            }

            todo.CreatedDate = DateTime.Now;
            todo.CompletedDate = null;

            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTodo", new { id = todo.Id }, todo);
        }

        // PUT: api/todos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodo(int id, Todo todo)
        {
            if (id != todo.Id)
            {
                return BadRequest();
            }

            _context.Entry(todo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PATCH: api/todos/5/complete
        [HttpPatch("{id}/complete")]
        public async Task<ActionResult<Todo>> ToggleTodoComplete(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            todo.IsCompleted = !todo.IsCompleted;
            todo.CompletedDate = todo.IsCompleted ? DateTime.Now : null;

            await _context.SaveChangesAsync();

            return todo;
        }

        // DELETE: api/todos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoExists(int id)
        {
            return _context.Todos.Any(e => e.Id == id);
        }
    }
}