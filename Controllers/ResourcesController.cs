using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;
using WarehouseManager.Models;

namespace WarehouseManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ResourcesController : ControllerBase
    {
        private readonly WarehouseDbContext _context;

        public ResourcesController(WarehouseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResources([FromQuery] bool archived = false)
        {
            return await _context.Resources
                .Where(r => r.IsArchived == archived)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Resource>> CreateResource([FromBody] Resource resource)
        {
            if (resource == null || string.IsNullOrEmpty(resource.Name))
                return BadRequest("Некорректные данные");

            resource.Id = Guid.NewGuid();
            resource.IsArchived = false;

            try
            {
                _context.Resources.Add(resource);
                await _context.SaveChangesAsync();
                return Ok(resource);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine("DB ERROR: " + ex.InnerException?.Message); // ← добавлено

                if (ex.InnerException?.Message.Contains("IX_Resources_Name") == true)
                {
                    return Conflict("Ресурс с таким наименованием уже существует");
                }

                return StatusCode(500, "Ошибка при сохранении ресурса");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResource(Guid id, [FromBody] Resource resource)
        {
            var existing = await _context.Resources.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = resource.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return NotFound();

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("archived")]
        public async Task<IActionResult> GetArchivedResources()
        {
            var archived = await _context.Resources
                .Where(r => r.IsArchived)
                .ToListAsync();

            return new JsonResult(archived)
            {
                ContentType = "application/json; charset=utf-8"
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Resource>> GetResource(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);

            if (resource == null)
            {
                return NotFound();
            }

            return resource;
        }

        [HttpPost("{id:guid}/archive")]
        public async Task<IActionResult> Archive(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return NotFound("Ресурс не найден");

            resource.IsArchived = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Ресурс перемещён в архив" });
        }

        [HttpPost("{id:guid}/unarchive")]
        public async Task<IActionResult> UnarchiveResource(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return NotFound("Ресурс не найден");

            resource.IsArchived = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Ресурс возвращён в рабочие" });
        }
    }
}
