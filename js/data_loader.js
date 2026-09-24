window.Nodoka = window.Nodoka || {};
Nodoka.loadData = async function() {
  const fallback = window.NODOKA_DATA || {};
  const result = {
    dialogues: [...(fallback.dialogues || [])],
    poses: [...(fallback.poses || [])],
    events: [...(fallback.events || [])]
  };

  if (location.protocol === 'file:') return result;

  const files = [
    ['dialogues', 'data/dialogues.csv'],
    ['poses', 'data/poses.csv'],
    ['events', 'data/events.csv']
  ];
  await Promise.all(files.map(async ([key, path]) => {
    try {
      const res = await fetch(path, {cache: 'no-store'});
      if (res.ok) result[key] = Nodoka.parseCSV(await res.text());
    } catch (e) {
      console.warn('CSV fallback used:', path, e);
    }
  }));
  return result;
};
