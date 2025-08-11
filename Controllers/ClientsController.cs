using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;
using WarehouseManager.Models;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly WarehouseDbContext _context;

    public ClientsController(WarehouseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool archived = false)
    {
        var clients = await _context.Clients
            .Where(c => c.IsArchived == archived)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();
        return Ok(client);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Client client)
    {
        client.Id = Guid.NewGuid();
        _context.Clients.Add(client);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Клиент добавлен" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Client updated)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.Name = updated.Name;
        client.Address = updated.Address;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Клиент обновлён" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Клиент удалён" });
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(Guid id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.IsArchived = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Клиент перемещён в архив" });
    }

    [HttpPost("{id}/unarchive")]
    public async Task<IActionResult> Unarchive(Guid id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.IsArchived = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Клиент возвращён в рабочие" });
    }
}
