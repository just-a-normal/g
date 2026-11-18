local Fonts = require("ui.fonts")
local Config = require("config")
local Gameplay = require("states.gameplay")
local graphics = love.graphics

local mod = { api = 1 }
local clocks = setmetatable({}, { __mode = "k" })
local ink = { 0.96, 0.95, 0.92 }
local muted = { 0.70, 0.72, 0.72 }
local mint = { 0.69, 0.95, 0.81 }
local amber = { 1, 0.78, 0.40 }
local danger = { 1, 0.45, 0.41 }

local function text(value, font, color, x, y)
    graphics.setFont(font)
    graphics.setColor(color)
    graphics.print(value, x, y)
end

local function timecode(seconds)
    local ms = math.floor(seconds * 1000)
    return string.format("%02d:%02d.%03d", math.floor(ms / 60000),
        math.floor(ms / 1000) % 60, ms % 1000)
end

local function hp(value)
    value = math.max(0, value)
    return value == math.floor(value) and tostring(value) or string.format("%.1f", value)
end

function mod.update(dt, top)
    if top ~= Gameplay then return end
    local world = top.world
    local clock = clocks[world]
    if not clock then
        clock = { elapsed = 0 }
        clocks[world] = clock
    end
    local phase = top.phase
    if not world.player.alive or top.dialogue:isBlocking() or (top.stage.horde and top:hordePaused()) then return end
    if phase == "play" or phase == "clash" or phase == "qte" then
        clock.elapsed = clock.elapsed + dt
    end
end

function mod.drawPlayerHealth(player, x, y, _, compact)
    local health = player.alive and player.hp or 0
    local ratio = hp(health) .. " / " .. hp(player.maxHp) .. " HP"
    local font = compact and Fonts.small or Fonts.body
    text(ratio, font, health <= 1 and danger or mint, x, y)
    if (player.overhealth or 0) > 0 then
        local bonus = "+" .. hp(player.overhealth) .. "   " .. string.format("%.1fs", math.max(0, player.overT or 0))
        text(bonus, Fonts.small, amber, x + font:getWidth(ratio) + 12, y + (compact and 0 or 2))
    end
    return true
end

function mod.drawBossHealth(boss, x, y, width)
    local label = hp(boss.hp) .. " / " .. hp(boss.maxHp) .. " HP"
    local remaining = boss.hp / boss.maxHp
    local nextPhase
    for _, mark in ipairs(boss.def.stages or { boss.def.midAt or 0.5 }) do
        if mark > 0 and mark < remaining and (not nextPhase or mark > nextPhase) then nextPhase = mark end
    end
    text(label, Fonts.body, danger, x, y - 2)
    if nextPhase then
        local phase = "NEXT PHASE AT " .. hp(boss.maxHp * nextPhase) .. " HP"
        text(phase, Fonts.tiny, muted, x + width - Fonts.tiny:getWidth(phase), y + 1)
    end
    return true
end

function mod.drawAllyHealth(ally, x, y, safe)
    local label = hp(ally.alive and ally.hp or 0) .. " / " .. hp(ally.maxHp) .. " HP"
    text(label, Fonts.small, { 0.84, 0.70, 1 }, x, y)
    if safe and ally.alive then
        text("SAFE", Fonts.tiny, muted, x + Fonts.small:getWidth(label) + 7, y + 1)
    end
    return true
end

function mod.drawCombo(scoring, width, height)
    local callout = scoring.callout
    if not callout then return true end
    -- The regular draw slot also contains the stock full-screen combo flash.
    local alpha = math.max(0, math.min(1, (1.6 - callout.t) * 4))
    local font = Fonts.med
    local w = font:getWidth(callout.text) + 44
    local x, y = width - w - 16, height - 126
    graphics.setColor(0.07, 0.09, 0.09, 0.93 * alpha)
    graphics.rectangle("fill", x, y, w, 36, 3, 3)
    graphics.setColor(amber[1], amber[2], amber[3], alpha)
    graphics.rectangle("fill", x, y, 3, 36)
    graphics.setFont(font)
    graphics.print(callout.text, x + 22, y + 5)
    return true
end

function mod.drawComboStatus(scoring, x, y)
    if scoring.combo > 0 then
        local frenzy = scoring.combo >= Config.frenzy.combo
        local color = frenzy and danger or amber
        text(string.format("%d %s", scoring.combo, frenzy and "FRENZY" or "COMBO"), Fonts.small, color, x, y)
        local mult = "x" .. scoring.multiplier
        text(mult, Fonts.large, color, x + 226 - Fonts.large:getWidth(mult), y - 40)
        graphics.setColor(0.20, 0.21, 0.21)
        graphics.rectangle("fill", x, y + 18, 226, 4)
        graphics.setColor(color)
        graphics.rectangle("fill", x, y + 18, 226 * math.min(1, math.max(0, scoring.comboTimer / 3.5)), 4)
    else
        text("COMBO  0", Fonts.small, muted, x, y)
    end
    return true
end

function mod.drawHUD(game, width, height)
    local x, y = width - 266, height - 82
    graphics.setColor(0.06, 0.08, 0.08, 0.9)
    graphics.rectangle("fill", x, y, 250, 66, 4, 4)
    graphics.setColor(mint)
    graphics.rectangle("fill", x, y, 3, 66)
    local clock = clocks[game.world]
    text("ATTEMPT", Fonts.tiny, muted, x + 13, y + 8)
    text(timecode(clock and clock.elapsed or 0), Fonts.med, ink, x + 13, y + 20)
    local fps = love.timer.getFPS()
    local stats = string.format("%d FPS    %.1f ms/frame", fps, love.timer.getAverageDelta() * 1000)
    text(stats, Fonts.small, mint, x + 13, y + 45)
end

return mod
