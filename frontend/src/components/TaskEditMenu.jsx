export default function TaskEditMenu({ form, setForm, onClose, onSubmit }) {
    return (
        <div>
            <form onSubmit={onSubmit}>
                <h2>Edit Task</h2>
                <label>Title</label>
                <input 
                    type="text"
                    value={form.title}
                    onChange={e => setForm({...form, title:e.target.value})}
                />
                <label>Description</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <label>Due Date</label>
                <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                />

                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit">Save</button>
            </form>
        </div>
    )
}