local lg = love.graphics
local Fonts = require("ui.fonts")
local mod = { api = 1 }

function mod.drawHUD(game, _, height)
    local world = game.world
    local player = world.player
    local x, y, radius, range = 74, height - 176, 52, 570
    lg.setColor(0.04, 0.07, 0.07, 0.89)
    lg.circle("fill", x, y, radius + 4, 36)
    lg.setColor(0.24, 0.40, 0.37)
    lg.setLineWidth(1)
    lg.circle("line", x, y, radius, 36)
    lg.circle("line", x, y, radius / 2, 24)
    lg.line(x - radius, y, x + radius, y)
    lg.line(x, y - radius, x, y + radius)
    lg.setFont(Fonts.tiny)
    lg.setColor(0.69, 0.95, 0.81)
    lg.printf("RADAR", x - radius, y + radius - 15, radius * 2, "center")

    local function dot(actor, size)
        if not actor.alive then return end
        local dx, dy = actor.x - player.x, actor.y - player.y
        if dx * dx + dy * dy <= range * range then
            lg.circle("fill", x + dx * radius / range, y + dy * radius / range, size, 12)
        end
    end
    lg.setColor(1, 0.42, 0.34)
    for _, enemy in ipairs(world.enemies) do dot(enemy, 2.5) end
    lg.setColor(1, 0.79, 0.35)
    if game.boss and game.boss.active then dot(game.boss, 4) end
    lg.setColor(0.69, 0.95, 0.81)
    lg.circle("fill", x, y, 3, 12)
end

return mod
