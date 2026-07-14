<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => Category::where('user_id', $request->user()->id)->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'type' => 'required|in:income, expense',
            'budget_limit' => 'nullable|numeric|min:0'
        ]);

        $category = Category::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'type' => $request->type,
            'budget_limit'=> $request->budget_limit
        ]);

        return response()->json(['status' => 'success', 'data' => $category], 201);
    }
}