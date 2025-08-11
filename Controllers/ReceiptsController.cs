using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;
using WarehouseManager.Models;

[ApiController]
[Route("api/[controller]")]
public class ReceiptsController : ControllerBase
{
    private readonly WarehouseDbContext _context;
    public ReceiptsController(WarehouseDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? number,
        [FromQuery] Guid? resourceId,
        [FromQuery] Guid? unitId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var q = _context.Receipts
            .Include(r => r.Items).ThenInclude(i => i.Resource)
            .Include(r => r.Items).ThenInclude(i => i.Unit)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(number))
            q = q.Where(r => r.Number.Contains(number));

        if (resourceId.HasValue)
            q = q.Where(r => r.Items.Any(i => i.ResourceId == resourceId.Value));

        if (unitId.HasValue)
            q = q.Where(r => r.Items.Any(i => i.UnitId == unitId.Value));

        if (dateFrom.HasValue)
            q = q.Where(r => r.Date >= dateFrom.Value.Date);

        if (dateTo.HasValue)
        {
            var dt = dateTo.Value.Date.AddDays(1).AddTicks(-1);
            q = q.Where(r => r.Date <= dt);
        }

        var list = await q.OrderByDescending(r => r.Date).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Items).ThenInclude(i => i.Resource)
            .Include(r => r.Items).ThenInclude(i => i.Unit)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null) return NotFound();
        return Ok(receipt);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Receipt receipt)
    {
        if (string.IsNullOrWhiteSpace(receipt?.Number))
            return BadRequest(new { message = "Введите номер" });

        var exists = await _context.Receipts.AnyAsync(r => r.Number == receipt.Number);
        if (exists)
            return Conflict(new { message = $"Поступление с номером \"{receipt.Number}\" уже существует." });

        receipt.Id = Guid.NewGuid();

        receipt.Date = receipt.Date == default ? DateTime.UtcNow : receipt.Date;

        if (receipt.Items != null)
        {
            foreach (var item in receipt.Items)
            {
                item.Id = Guid.NewGuid();
                item.ReceiptId = receipt.Id;
                item.Receipt = null;
                item.Resource = null;
                item.Unit = null;
            }
        }

        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();

        return Ok(receipt);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Receipt updated)
    {
        var existing = await _context.Receipts.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == id);
        if (existing == null) return NotFound(new { message = "Поступление не найдено" });

        existing.Number = updated.Number;
        existing.Date = updated.Date == default ? existing.Date : updated.Date;

        _context.ReceiptItems.RemoveRange(existing.Items);
        if (updated.Items != null)
        {
            foreach (var it in updated.Items)
            {
                it.Id = Guid.NewGuid();
                it.ReceiptId = existing.Id;
            }
            await _context.ReceiptItems.AddRangeAsync(updated.Items);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Поступление обновлено" });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var receipt = await _context.Receipts.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == id);
        if (receipt == null) return NotFound();

        _context.ReceiptItems.RemoveRange(receipt.Items);
        _context.Receipts.Remove(receipt);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Поступление удалено" });
    }
}
