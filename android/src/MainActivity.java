package tech.vetorial.drive;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DriveNativo.class);
        super.onCreate(savedInstanceState);
    }
}
