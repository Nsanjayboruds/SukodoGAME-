#include <emscripten.h>
#include <cstring>

extern "C" {

    EMSCRIPTEN_KEEPALIVE
    int is_valid(int* board, int pos, int val) {
        int row = pos / 9;
        int col = pos % 9;

        for (int i = 0; i < 9; i++) {
            if (board[row * 9 + i] == val || board[i * 9 + col] == val)
                return 0;

            int boxRow = (row / 3) * 3 + i / 3;
            int boxCol = (col / 3) * 3 + i % 3;
            if (board[boxRow * 9 + boxCol] == val)
                return 0;
        }
        return 1;
    }

    EMSCRIPTEN_KEEPALIVE
    int solve(int* board, int pos = 0) {
        if (pos == 81) return 1; 
        if (board[pos] != 0) return solve(board, pos + 1);

        for (int num = 1; num <= 9; num++) {
            if (is_valid(board, pos, num)) {
                board[pos] = num;
                if (solve(board, pos + 1)) return 1;
                board[pos] = 0;
            }
        }
        return 0; // No solution
    }
}
