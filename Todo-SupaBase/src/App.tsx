import { useState, useEffect } from "react";
import { supabase } from "./helper/supabaseClient";

interface Todo {
  id: number;
  title: string;
  complete: boolean;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("Todos").select("*");
    console.log("Fetched todos:", data); // Log the fetched data
    if (error) {
      console.error("Error fetching todos:", error);
    } else if (data) {
      setTodos(data);
    }
  };

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    setTodos((prevTodos) => [...prevTodos, { id: Date.now(), title: newTodo, complete: false }]);
    const { error } = await supabase.from("Todos").insert([{ title: newTodo }]);
    if (error) {
      console.error("Error adding todo:", error);
      setTodos((prevTodos) => prevTodos.slice(0, -1));
      setNewTodo(""); // Clear input even if there's an error
    } else {
      setNewTodo("");
      fetchTodos(); // Re-fetch immediately after adding
    }
  };

  const handleDeleteTodo = async (id: number) => {
    let backupTodos = [...todos]; // Backup current todos
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    const { error } = await supabase.from("Todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      setTodos(backupTodos); // Restore the backup if there's an error
    } else {
      fetchTodos();
    }
  };

  const handleEditTodo = async (id: number, currentTitle: string) => {
    let backupTodos = [...todos]; // Backup current todos
    setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, title: currentTitle } : todo)));
    const newTitle = prompt("Enter the new title for the todo:", currentTitle);
    if (!newTitle || newTitle.trim() === "") return;

    const { error } = await supabase
      .from("Todos")
      .update({ title: newTitle.trim() })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      setTodos(backupTodos); // Restore the backup if there's an error
    } else {
      fetchTodos();
    }
  };

  const handleToggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("Todos")
      .update({ complete: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      fetchTodos();
    }
  };

  // Fetch only once when component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Todo App</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>

      <div>
        <h3>Active Tasks</h3>
        {todos
          .filter((todo) => !todo.complete)
          .map((todo) => (
            <div key={todo.id} style={{ margin: "8px 0" }}>
              <span style={{ marginRight: "10px" }}>{todo.title}</span>
              <button onClick={() => handleEditTodo(todo.id, todo.title)}>
                Edit
              </button>
              <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
              <button onClick={() => handleToggleComplete(todo.id, todo.complete)}>
                Complete
              </button>
            </div>
          ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Completed Tasks</h3>
        {todos
          .filter((todo) => todo.complete)
          .map((todo) => (
            <div key={todo.id} style={{ margin: "8px 0", color: "#888" }}>
              <span
                style={{
                  textDecoration: "line-through",
                  marginRight: "10px",
                }}
              >
                {todo.title}
              </span>
              <button onClick={() => handleToggleComplete(todo.id, todo.complete)}>
                Undo
              </button>
              <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;