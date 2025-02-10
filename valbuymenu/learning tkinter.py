import tkinter as tk
window = tk.Tk()

#title of window
window.title("VALORANT Buy Menu") 
#color of background
window.configure(background="lightblue")

#add a border
#have a background, and then make it a frame
#window.config(bg="blue")
#frame = tk.Frame(window, width = 400, height = 400)
#frame.pack(padx = 30, pady = 30)

#minimum size and maximum size of the window that pops up
window.minsize(500, 500)
window.maxsize(2000, 2000)
#window width x widow height + x-coordinate + y-coordinate where you want it to show up
window.geometry("300x3+500+500")


#creating labels
#text
tk.Label(window,  text="VALORANT BUY MENU").pack()
tk.Label(window, text = "- yeah i play val lol").pack()
#images
#image = tk.PhotoImage(file="images/plzwork.png")
#tk.Label(window, image = image).pack()


#buttons
ability1 = tk.Button(window, text = "Updraft")
ability1.pack()

ability2 = tk.Button(window, text = "Cloudburst")
ability2.pack()

exit = tk.Button(window, text = "Exit Buy Menu", command = window.destroy)
exit.pack()
window.mainloop()




#notes
#have to close tkinter to do a new window
#pack method is a geomettry manage used to pack or place widget on current window. label will stay in to;-center part of window if size is adjusted

#can do pack like this:
#label1 = tk.Label(root, text="Nothing will work unless you do.")
#label1.pack()