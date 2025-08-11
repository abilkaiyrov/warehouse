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
public class ShipmentsController : ControllerBase
{
    private readonly WarehouseDbContext _db;
    public ShipmentsController(WarehouseDbContext db) => _db = db;
    public record ShipmentItemDto(Guid ResourceId, Guid UnitId, decimal Quantity);
    public record CreateShipmentDto(string Number, DateTime Date, Guid ClientId, List<ShipmentItemDto> Items);

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? number,
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? resourceId,
        [FromQuery] Guid? unitId)
    {
        var q = _db.Shipments
            .Include(s => s.Client)
            .Include(s => s.Items).ThenInclude(i => i.Resource)
            .Include(s => s.Items).ThenInclude(i => i.Unit)
            .AsQueryable();

        if (dateFrom.HasValue) q = q.Where(s => s.Date >= dateFrom.Value.Date);
        if (dateTo.HasValue) q = q.Where(s => s.Date <= dateTo.Value.Date.AddDays(1).AddTicks(-1));
        if (!string.IsNullOrWhiteSpace(number)) q = q.Where(s => s.Number.Contains(number));
        if (clientId.HasValue) q = q.Where(s => s.ClientId == clientId.Value);
        if (resourceId.HasValue) q = q.Where(s => s.Items.Any(i => i.ResourceId == resourceId));
        if (unitId.HasValue) q = q.Where(s => s.Items.Any(i => i.UnitId == unitId));

        var list = await q.OrderByDescending(s => s.Date).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _db.Shipments
            .Include(x => x.Client)
            .Include(x => x.Items).ThenInclude(i => i.Resource)
            .Include(x => x.Items).ThenInclude(i => i.Unit)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return NotFound();

        return Ok(s);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Shipment dto)
    {
        if (dto == null) return BadRequest(new { message = "Пустое тело запроса" });
        if (string.IsNullOrWhiteSpace(dto.Number))
            return BadRequest(new { message = "Укажите номер" });
        if (dto.ClientId == Guid.Empty)
            return BadRequest(new { message = "Выберите клиента" });
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest(new { message = "Добавьте хотя бы одну позицию" });

        var clientExists = await _db.Clients.AnyAsync(c => c.Id == dto.ClientId && !c.IsArchived);
        if (!clientExists) return BadRequest(new { message = "Клиент не найден" });

        var itemIds = dto.Items.Select(i => i.ResourceId).ToHashSet();
        var unitIds = dto.Items.Select(i => i.UnitId).ToHashSet();

        var allResourcesExist = await _db.Resources.Where(r => itemIds.Contains(r.Id)).CountAsync() == itemIds.Count;
        if (!allResourcesExist) return BadRequest(new { message = "Некоторые ресурсы не найдены" });

        var allUnitsExist = await _db.Units.Where(u => unitIds.Contains(u.Id)).CountAsync() == unitIds.Count;
        if (!allUnitsExist) return BadRequest(new { message = "Некоторые единицы измерения не найдены" });

        if (await _db.Shipments.AnyAsync(x => x.Number == dto.Number))
            return Conflict(new { message = $"Отгрузка с номером \"{dto.Number}\" уже существует." });

        dto.Id = Guid.NewGuid();
        dto.Status = ShipmentStatus.Unsigned;

        foreach (var it in dto.Items)
        {
            it.Id = Guid.NewGuid();
            it.ShipmentId = dto.Id;
            it.Shipment = null;
            it.Resource = null;
            it.Unit = null;
        }

        _db.Shipments.Add(dto);
        await _db.SaveChangesAsync();

        return Ok(new { id = dto.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Shipment dto)
    {
        if (dto == null) return BadRequest(new { message = "Пустое тело запроса" });
        if (dto.Id != Guid.Empty && dto.Id != id)
            return BadRequest(new { message = "ID в URL не совпадает с ID в теле" });
        if (string.IsNullOrWhiteSpace(dto.Number))
            return BadRequest(new { message = "Укажите номер" });
        if (dto.ClientId == Guid.Empty)
            return BadRequest(new { message = "Выберите клиента" });

        var s = await _db.Shipments
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return NotFound(new { message = "Отгрузка не найдена" });
        if (s.Status == ShipmentStatus.Signed)
            return BadRequest(new { message = "Нельзя редактировать подписанную отгрузку" });

        s.Number = dto.Number.Trim();
        s.Date = dto.Date;
        s.ClientId = dto.ClientId;

        var incomingIds = (dto.Items ?? new List<ShipmentItem>())
            .Where(i => i.Id != Guid.Empty)
            .Select(i => i.Id)
            .ToHashSet();

        var toDelete = s.Items.Where(i => !incomingIds.Contains(i.Id)).ToList();
        _db.ShipmentItems.RemoveRange(toDelete);

        foreach (var it in dto.Items ?? Enumerable.Empty<ShipmentItem>())
        {
            if (it.Id == Guid.Empty)
            {
                var n = new ShipmentItem
                {
                    Id = Guid.NewGuid(),
                    ShipmentId = s.Id,
                    ResourceId = it.ResourceId,
                    UnitId = it.UnitId,
                    Quantity = it.Quantity
                };
                _db.ShipmentItems.Add(n);
            }
            else
            {
                var ex = s.Items.FirstOrDefault(x => x.Id == it.Id);
                if (ex == null)
                {
                    var n = new ShipmentItem
                    {
                        Id = it.Id,
                        ShipmentId = s.Id,
                        ResourceId = it.ResourceId,
                        UnitId = it.UnitId,
                        Quantity = it.Quantity
                    };
                    _db.ShipmentItems.Add(n);
                }
                else
                {
                    ex.ResourceId = it.ResourceId;
                    ex.UnitId = it.UnitId;
                    ex.Quantity = it.Quantity;
                }
            }
        }

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "Конфликт сохранения: записи были изменены или удалены. Обновите страницу и попробуйте снова." });
        }

        return NoContent();
    }

    [HttpGet("availability")]
    public async Task<IActionResult> Availability()
    {
        var rec = await _db.ReceiptItems
            .GroupBy(i => new { i.ResourceId, i.UnitId })
            .Select(g => new {
                g.Key.ResourceId,
                g.Key.UnitId,
                Qty = (decimal?)g.Sum(x => x.Quantity)
            })
            .ToListAsync();

        var ship = await _db.ShipmentItems
            .Where(si => si.Shipment.Status == ShipmentStatus.Signed)
            .GroupBy(i => new { i.ResourceId, i.UnitId })
            .Select(g => new {
                g.Key.ResourceId,
                g.Key.UnitId,
                Qty = (decimal?)g.Sum(x => x.Quantity)
            })
            .ToListAsync();

        var shipLookup = ship.ToDictionary(k => (k.ResourceId, k.UnitId), v => v.Qty ?? 0m);

        var resNames = await _db.Resources.ToDictionaryAsync(r => r.Id, r => r.Name);
        var unitNames = await _db.Units.ToDictionaryAsync(u => u.Id, u => u.Name);

        var result = rec.Select(r =>
        {
            var shipped = shipLookup.TryGetValue((r.ResourceId, r.UnitId), out var s) ? s : 0m;
            var available = (r.Qty ?? 0m) - shipped;

            return new
            {
                resourceId = r.ResourceId,
                resourceName = resNames.TryGetValue(r.ResourceId, out var rn) ? rn : null,
                unitId = r.UnitId,
                unitName = unitNames.TryGetValue(r.UnitId, out var un) ? un : null,
                available
            };
        })
        .Where(x => x.available > 0)
        .OrderBy(x => x.resourceName)
        .ThenBy(x => x.unitName)
        .ToList();

        return Ok(result);
    }

    

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var s = await _db.Shipments.FindAsync(id);
        if (s == null) return NotFound();
        _db.Shipments.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/sign")]
    public async Task<IActionResult> Sign(Guid id)
    {
        var s = await _db.Shipments.FindAsync(id);
        if (s == null) return NotFound();
        s.Status = ShipmentStatus.Signed;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/revoke")]
    public async Task<IActionResult> Revoke(Guid id)
    {
        var s = await _db.Shipments.FindAsync(id);
        if (s == null) return NotFound();
        s.Status = ShipmentStatus.Unsigned;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
