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
    public class UnitsController : ControllerBase
    {
        private readonly WarehouseDbContext _context;

        public UnitsController(WarehouseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUnits([FromQuery] bool archived = false)
        {
            var data = await _context.Units
                .Where(u => u.IsArchived == archived)
                .ToListAsync();

            return new JsonResult(data)
            {
                ContentType = "application/json; charset=utf-8"
            };
        }

        [HttpGet("archived")]
        public async Task<IActionResult> GetArchivedUnits()
        {
            var data = await _context.Units
                .Where(u => u.IsArchived)
                .ToListAsync();

            return new JsonResult(data)
            {
                ContentType = "application/json; charset=utf-8"
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Unit>> GetUnit(Guid id)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null) return NotFound();
            return unit;
        }

        [HttpPost]
        public async Task<ActionResult<Unit>> CreateUnit([FromBody] Unit unit)
        {
            unit.Id = Guid.NewGuid();
            unit.IsArchived = false;

            _context.Units.Add(unit);
            await _context.SaveChangesAsync();

            return Ok(unit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnit(Guid id, [FromBody] Unit unit)
        {
            var existing = await _context.Units.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = unit.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUnit(Guid id)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null) return NotFound();

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/archive")]
        public async Task<IActionResult> Archive(Guid id)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null) return NotFound();

            unit.IsArchived = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/unarchive")]
        public async Task<IActionResult> Unarchive(Guid id)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null) return NotFound();

            unit.IsArchived = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
