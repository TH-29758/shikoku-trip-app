import assert from 'node:assert/strict';
import test from 'node:test';
import { accommodations, dinnerSpot, ehimeStay, linkCategories, spotAliases, spotCategories, tripDays, tripEvents } from '../src/data/trip.ts';

test('every itinerary, accommodation and useful link resolves to a unique map destination', () => {
  const spots = spotCategories.flatMap(category => category.spots);
  const ids = new Set(spots.map(spot => spot.id));
  assert.equal(ids.size, spots.length, 'map anchors must be unique');
  for (const day of tripDays) {
    for (const item of day.items) {
      for (const place of item.places ?? []) assert.ok(ids.has(place.id), `${day.id}: missing map destination ${place.id}`);
      if (item.stayId) assert.ok(accommodations.some(stay => stay.id === item.stayId));
    }
    if (day.stayId) assert.ok(accommodations.some(stay => stay.id === day.stayId));
  }
  for (const stay of accommodations) assert.ok(ids.has(stay.id));
  for (const category of linkCategories) {
    for (const link of category.links) {
      assert.equal(new URL(link.url).protocol, 'https:');
      if (link.spotId) assert.ok(ids.has(link.spotId));
    }
  }
});

test('schedule dates are consecutive and match the displayed weekday in Japan', () => {
  const weekday = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', weekday: 'short' });
  tripDays.forEach((day, index) => {
    const date = new Date(`${day.date}T12:00:00+09:00`);
    assert.equal(weekday.format(date), day.weekday);
    assert.equal(day.number, index + 1);
    if (index > 0) assert.equal(Date.parse(day.date) - Date.parse(tripDays[index - 1].date), 86400000);
  });
});

test('home events come from itinerary entries and remain chronological with explicit Japan time', () => {
  const timedItems = tripDays.flatMap(day => day.items.filter(item => item.at && item.status !== 'optional').map(item => ({ day, item })));
  assert.equal(tripEvents.length, timedItems.length);
  tripEvents.forEach((event, index) => {
    assert.match(event.datetime, /\+09:00$/);
    assert.ok(Number.isFinite(Date.parse(event.datetime)));
    assert.equal(event.title, timedItems[index].item.title);
    assert.equal(event.desc, timedItems[index].item.desc);
    assert.equal(event.timeStr, timedItems[index].item.time);
    if (index > 0) assert.ok(Date.parse(event.datetime) >= Date.parse(tripEvents[index - 1].datetime));
  });
});

test('hotel and dinner changes stay consistent across saved links, map and schedule', () => {
  assert.equal(spotAliases['88hotels'], ehimeStay.id);
  assert.equal(spotAliases.ikkaku_takamatsu, dinnerSpot.id);
  assert.equal(spotAliases.ikkaku_nakabu, dinnerSpot.id);
  assert.equal(spotAliases.ranmaru, dinnerSpot.id);
  assert.equal(tripDays[1].stayId, ehimeStay.id);
  assert.ok(tripDays[0].items.some(item => item.title === dinnerSpot.name && item.places?.some(place => place.id === dinnerSpot.id)));
  assert.ok(tripDays[1].items.some(item => item.stayId === ehimeStay.id && item.title.includes(ehimeStay.name)));
  assert.ok(spotCategories.flatMap(category => category.spots).some(spot => spot.id === ehimeStay.id && spot.query.includes(ehimeStay.address)));
  assert.ok(spotCategories.flatMap(category => category.spots).some(spot => spot.id === dinnerSpot.id && spot.name === dinnerSpot.name));
  assert.equal(dinnerSpot.query, '高松市 骨付鳥');
  assert.ok(!JSON.stringify(tripDays).includes('蘭丸'));
  assert.ok(!JSON.stringify(linkCategories).includes('honetsuki-ranmaru'));
});

test('the attached seven-person hotel quote divides exactly and is a reference, not a booking', () => {
  assert.ok(ehimeStay.reference);
  assert.equal(ehimeStay.reference.total, 46284);
  assert.equal(ehimeStay.reference.guests, 7);
  assert.equal(ehimeStay.reference.total / ehimeStay.reference.guests, ehimeStay.reference.perPerson);
});
